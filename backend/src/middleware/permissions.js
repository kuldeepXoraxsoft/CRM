import ApiError from "../utils/ApiError.js";
import { hasPermission } from "../constants/permissions.js";

/**
 * Route-level permission gate. Use after `authenticate`:
 *   router.post("/", authenticate, authorize("ADD_EMPLOYEE"), controller.create)
 */
export function authorize(permissionKey) {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated.");
    }

    if (!hasPermission(req.user.role, permissionKey)) {
      throw new ApiError(403, "You don't have permission to do that.");
    }

    next();
  };
}