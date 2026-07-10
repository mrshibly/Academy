"""
Seed script — populates default roles, permissions, and an admin user.
Run via: python -m scripts.seed
"""
import asyncio
import uuid
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.role import Role, Permission, RolePermission, UserRole
from app.models.user import User
from app.core.security import hash_password

DEFAULT_ROLES = ["student", "instructor", "corporate_client", "admin"]

RESOURCES = ["users", "courses", "enrollments", "blog", "research", "services", "bookings", "contacts", "quotes", "certificates", "cohorts", "tickets", "careers", "audit_logs", "orders"]
ACTIONS = ["create", "read", "update", "delete"]

# Admin gets all permissions; other roles get subset
ROLE_PERMISSIONS = {
    "admin": [(r, a) for r in RESOURCES for a in ACTIONS],
    "instructor": [("courses", "create"), ("courses", "read"), ("courses", "update"), ("enrollments", "read")],
    "student": [("courses", "read"), ("enrollments", "create"), ("enrollments", "read"), ("tickets", "create"), ("tickets", "read"), ("certificates", "read")],
    "corporate_client": [("enrollments", "read"), ("cohorts", "read"), ("orders", "read")],
}


async def seed() -> None:
    async with async_session_factory() as db:
        # Create roles
        roles = {}
        for name in DEFAULT_ROLES:
            existing = (await db.execute(select(Role).where(Role.name == name))).scalar_one_or_none()
            if existing:
                roles[name] = existing
            else:
                role = Role(name=name, description=f"Default {name} role")
                db.add(role)
                await db.flush()
                roles[name] = role

        # Create permissions
        perms = {}
        for resource in RESOURCES:
            for action in ACTIONS:
                key = (resource, action)
                existing = (await db.execute(select(Permission).where(Permission.resource == resource, Permission.action == action))).scalar_one_or_none()
                if existing:
                    perms[key] = existing
                else:
                    perm = Permission(resource=resource, action=action)
                    db.add(perm)
                    await db.flush()
                    perms[key] = perm

        # Assign permissions to roles
        for role_name, perm_list in ROLE_PERMISSIONS.items():
            role = roles[role_name]
            for resource, action in perm_list:
                perm = perms[(resource, action)]
                existing = (await db.execute(select(RolePermission).where(RolePermission.role_id == role.id, RolePermission.permission_id == perm.id))).scalar_one_or_none()
                if not existing:
                    db.add(RolePermission(role_id=role.id, permission_id=perm.id))

        # Create default admin user
        admin_email = "admin@academy.dev"
        existing_admin = (await db.execute(select(User).where(User.email == admin_email))).scalar_one_or_none()
        if not existing_admin:
            admin_user = User(email=admin_email, hashed_password=hash_password("admin123456"), full_name="Platform Admin", is_active=True, is_verified=True)
            db.add(admin_user)
            await db.flush()
            db.add(UserRole(user_id=admin_user.id, role_id=roles["admin"].id))

        await db.commit()
        print("✅ Seed complete: roles, permissions, and admin user created.")


if __name__ == "__main__":
    asyncio.run(seed())
