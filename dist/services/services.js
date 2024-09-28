"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greetingService = exports.exampleService = void 0;
const exampleService = async () => {
    return 'This is example data from the service layer.';
};
exports.exampleService = exampleService;
const greetingService = async (name) => {
    return `Hello ${name}...`;
};
exports.greetingService = greetingService;
