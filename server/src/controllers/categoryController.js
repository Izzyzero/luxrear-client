import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─────────────────────────────────────────────
// GET /api/categories
// Query: ?type=community|learning|exchange
// ─────────────────────────────────────────────
export const getAllCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    const filter = {};
    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    return successResponse(res, 200, 'Categories fetched.', { categories });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/categories/:id
// ─────────────────────────────────────────────
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return errorResponse(res, 404, 'Category not found.');
    }

    return successResponse(res, 200, 'Category fetched.', { category });
  } catch (error) {
    next(error);
  }
};