# Code Examples - JWT Authentication Usage

## Example 1: Basic Protected Route

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('example')
export class ExampleController {
    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getProtectedData() {
        return { message: 'This data is protected!' };
    }
}
```

## Example 2: Get Current User with Decorator

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('example')
export class ExampleController {
    @UseGuards(JwtAuthGuard)
    @Get('my-data')
    getMyData(@CurrentUser() user: any) {
        return {
            message: `Hello ${user.name}!`,
            userId: user.userId,
            email: user.email,
            phone: user.phone
        };
    }
}
```

## Example 3: Get Current User with Request Object

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('example')
export class ExampleController {
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return {
            userId: req.user.userId,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone
        };
    }
}
```

## Example 4: Protect Entire Controller

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('my-resource')
@UseGuards(JwtAuthGuard) // All routes in this controller are protected
export class MyResourceController {
    @Get()
    findAll(@CurrentUser() user: any) {
        return { message: 'Getting all resources', userId: user.userId };
    }

    @Post()
    create(@CurrentUser() user: any) {
        return { message: 'Creating resource', createdBy: user.userId };
    }
}
```

## Example 5: Conditional Protection (Some Routes Public)

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('blog')
export class BlogController {
    // Public route - anyone can access
    @Get()
    findAll() {
        return { message: 'All blog posts (public)' };
    }

    // Public route - anyone can read
    @Get(':id')
    findOne(@Param('id') id: string) {
        return { message: `Blog post ${id} (public)` };
    }

    // Protected route - only authenticated users
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@CurrentUser() user: any, @Body() createDto: any) {
        return {
            message: 'Creating blog post',
            author: user.name,
            authorId: user.userId
        };
    }

    // Protected route - only authenticated users
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@CurrentUser() user: any, @Param('id') id: string) {
        return { message: `Updating post ${id}`, updatedBy: user.userId };
    }
}
```

## Example 6: Using Auth in Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) {}

    // Create post with author
    async create(userId: number, title: string, content: string) {
        return this.prisma.post.create({
            data: {
                title,
                content,
                authorId: userId, // Use the authenticated user's ID
            },
        });
    }

    // Get posts by current user
    async findMyPosts(userId: number) {
        return this.prisma.post.findMany({
            where: { authorId: userId },
        });
    }
}
```

## Example 7: Complete CRUD with Auth

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    async create(
        @CurrentUser() user: any,
        @Body() createDto: { title: string; content: string }
    ) {
        return this.postsService.create(
            user.userId,
            createDto.title,
            createDto.content
        );
    }

    @Get('my-posts')
    async getMyPosts(@CurrentUser() user: any) {
        return this.postsService.findMyPosts(user.userId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.findOne(id);
    }

    @Patch(':id')
    async update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: any
    ) {
        return this.postsService.update(id, user.userId, updateDto);
    }

    @Delete(':id')
    async remove(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.postsService.remove(id, user.userId);
    }
}
```

## Example 8: Company-Scoped Resources

```typescript
import { Controller, Get, Post, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompanyService } from './company.service';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    // Get companies where current user is a member
    @Get('my-companies')
    async getMyCompanies(@CurrentUser() user: any) {
        return this.companyService.findByUserId(user.userId);
    }

    // Get company details (verify user has access)
    @Get(':id')
    async getCompany(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) companyId: number
    ) {
        return this.companyService.findOneWithAccess(companyId, user.userId);
    }

    // Create company (user becomes owner)
    @Post()
    async createCompany(
        @CurrentUser() user: any,
        @Body() createDto: any
    ) {
        return this.companyService.create({
            ...createDto,
            ownerId: user.userId // Set current user as owner
        });
    }
}
```

## Example 9: Custom Guard with Role Check

```typescript
// custom-role.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return requiredRoles.some((role) => user.role === role);
    }
}

// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Usage in controller
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
    @Get('dashboard')
    @Roles('admin', 'manager')
    getDashboard() {
        return { message: 'Admin dashboard data' };
    }
}
```

## Example 10: TypeScript Interface for User

```typescript
// interfaces/jwt-user.interface.ts
export interface JwtUser {
    userId: number;
    email: string;
    phone: string;
    name: string;
}

// Usage with type safety
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../interfaces/jwt-user.interface';

@Controller('example')
export class ExampleController {
    @UseGuards(JwtAuthGuard)
    @Get('typed')
    getTypedData(@CurrentUser() user: JwtUser) {
        // Now you get full TypeScript autocomplete
        return {
            userId: user.userId,
            name: user.name,
            email: user.email,
            phone: user.phone
        };
    }
}
```

## Testing with HTTP Client

### Using fetch (JavaScript/TypeScript)

```typescript
// Register
const registerResponse = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
        password: 'password123'
    })
});
const { access_token } = await registerResponse.json();

// Use token in protected route
const profileResponse = await fetch('http://localhost:3000/auth/profile', {
    headers: { 'Authorization': `Bearer ${access_token}` }
});
const profile = await profileResponse.json();
```

### Using axios (JavaScript/TypeScript)

```typescript
import axios from 'axios';

// Login
const { data } = await axios.post('http://localhost:3000/auth/login', {
    email: 'john@example.com',
    password: 'password123'
});

const token = data.access_token;

// Use token
const profile = await axios.get('http://localhost:3000/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
});
```

## Common Patterns

### Pattern 1: Create Resource for Current User
```typescript
@UseGuards(JwtAuthGuard)
@Post()
create(@CurrentUser() user: any, @Body() createDto: CreateDto) {
    return this.service.create({
        ...createDto,
        userId: user.userId // Automatically set creator
    });
}
```

### Pattern 2: Filter Resources by Current User
```typescript
@UseGuards(JwtAuthGuard)
@Get()
findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.userId); // Only user's resources
}
```

### Pattern 3: Verify Ownership Before Update
```typescript
@UseGuards(JwtAuthGuard)
@Patch(':id')
async update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDto
) {
    const resource = await this.service.findOne(id);
    if (resource.userId !== user.userId) {
        throw new ForbiddenException('You can only update your own resources');
    }
    return this.service.update(id, updateDto);
}
```
