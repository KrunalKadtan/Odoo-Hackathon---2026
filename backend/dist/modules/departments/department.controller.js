"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = void 0;
const department_service_js_1 = require("./department.service.js");
exports.departmentController = {
    async getAll(req, res, next) {
        try {
            const departments = await department_service_js_1.departmentService.getAllDepartments();
            res.status(200).json({ status: 'success', data: departments });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const department = await department_service_js_1.departmentService.createDepartment(req.body);
            res.status(201).json({ status: 'success', data: department });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const department = await department_service_js_1.departmentService.updateDepartment(req.params.id, req.body);
            res.status(200).json({ status: 'success', data: department });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=department.controller.js.map