"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentLimit = exports.cachingTimeOut = exports.apiResponse = void 0;
class apiResponse {
    constructor(status, message, data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
exports.apiResponse = apiResponse;
_a = [1800, 2], exports.cachingTimeOut = _a[0], exports.commentLimit = _a[1];
//# sourceMappingURL=index.js.map