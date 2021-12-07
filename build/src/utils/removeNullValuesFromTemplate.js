"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNullValuesFromTemplate = void 0;
const removeNullValuesFromTemplate = function (template) {
    let propsToRemove = [];
    for (let i in template) {
        if (template[i] === undefined || template[i] === null) {
            propsToRemove.push(i);
        }
        else if (Array.isArray(template[i])
            || template[i] instanceof Object) {
            (0, exports.removeNullValuesFromTemplate)(template[i]);
        }
    }
    for (let i in propsToRemove) {
        delete template[propsToRemove[i]];
    }
};
exports.removeNullValuesFromTemplate = removeNullValuesFromTemplate;
