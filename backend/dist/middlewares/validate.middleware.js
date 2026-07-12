"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map