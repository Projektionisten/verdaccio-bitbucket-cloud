"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hasher = void 0;
const crypto_1 = require("crypto");
const hash_wasm_1 = require("hash-wasm");
class Hasher {
    constructor(pluginOptions) {
        this.hashPassword = pluginOptions.hashPassword;
    }
    hash(password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hashPassword) {
                const salt = new Uint8Array(16);
                (0, crypto_1.randomFillSync)(salt);
                return (0, hash_wasm_1.bcrypt)({
                    password,
                    salt,
                    costFactor: 8
                });
            }
            else {
                return Promise.resolve(password);
            }
        });
    }
    verify(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hashPassword) {
                return (0, hash_wasm_1.bcryptVerify)(options);
            }
            else {
                return Promise.resolve(options.password === options.hash);
            }
        });
    }
}
exports.Hasher = Hasher;
