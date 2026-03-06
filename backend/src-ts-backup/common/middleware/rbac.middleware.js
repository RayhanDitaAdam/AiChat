import { Role } from "../types/auth.types.js";
import prisma from "../services/prisma.service.js";

/**
 * Middleware to check if user has required role(s)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        message: "Access denied. Insufficient permissions.",
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to ensure user is a regular USER
 */
export function requireUser() {
  return requireRole(Role.USER);
}
/**
 * Middleware to ensure user is an OWNER
 */
export function requireOwner() {
  return requireRole(Role.OWNER);
}

/**
 * Middleware to ensure user is an ADMIN
 */
export function requireAdmin() {
  return requireRole(Role.ADMIN);
}

/**
 * Middleware to ensure user is a SUPER_ADMIN
 */
export function requireSuperAdmin() {
  return requireRole(Role.SUPER_ADMIN);
}

/**
 * Middleware to ensure user is either an OWNER or STAFF member
 */
export function requireStaffOrOwner() {
  return requireRole(Role.OWNER, Role.STAFF, Role.CONTRIBUTOR);
}

/**
 * Middleware to ensure OWNER can only access their own data
 * Validates that :ownerId parameter matches user's ownerId
 */
export function requireOwnData() {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
      return;
    }

    // Only enforce for OWNER role
    if (req.user.role !== Role.OWNER) {
      next();
      return;
    }

    const requestedOwnerId = req.params.ownerId;

    if (!requestedOwnerId) {
      res.status(400).json({
        status: "error",
        message: "Owner ID is required.",
      });
      return;
    }

    if (req.user.ownerId !== requestedOwnerId) {
      res.status(403).json({
        status: "error",
        message: "Access denied. You can only access your own data.",
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to ensure OWNER is approved
 */
export function requireApproved() {
  return async (req, res, next) => {
    if (!req.user || req.user.role !== Role.OWNER || !req.user.ownerId) {
      next();
      return;
    }

    const owner = await prisma.owner.findUnique({
      where: { id: req.user.ownerId },
      select: { isApproved: true },
    });

    if (!owner || !owner.isApproved) {
      res.status(403).json({
        status: "error",
        message:
          "Access denied. Account is pending approval or has been revoked.",
      });
      return;
    }

    next();
  };
}
