"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveCaptchaServer = solveCaptchaServer;
// utils/solveCaptchaClient.js
const bitmaps_1 = require("./bitmaps");
const canvas_1 = require("canvas");
function getImageBlocks(pixelData, width, height) {
    const saturate = new Array(pixelData.length / 4);
    for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i], g = pixelData[i + 1], b = pixelData[i + 2];
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        saturate[i / 4] = max === 0 ? 0 : Math.round(((max - min) * 255) / max);
    }
    const img = [];
    for (let i = 0; i < 40; i++) {
        img[i] = [];
        for (let j = 0; j < 200; j++) {
            img[i][j] = saturate[i * 200 + j];
        }
    }
    const blocks = new Array(6);
    for (let i = 0; i < 6; i++) {
        const x1 = (i + 1) * 25 + 2;
        const y1 = 7 + 5 * (i % 2) + 1;
        const x2 = (i + 2) * 25 + 1;
        const y2 = 35 - 5 * ((i + 1) % 2);
        blocks[i] = img.slice(y1, y2).map(row => row.slice(x1, x2));
    }
    return blocks;
}
function binarizeImage(charImg) {
    let avg = 0;
    charImg.forEach(row => row.forEach(pixel => (avg += pixel)));
    avg /= charImg.length * charImg[0].length;
    const bits = new Array(charImg.length);
    for (let i = 0; i < charImg.length; i++) {
        bits[i] = new Array(charImg[0].length);
        for (let j = 0; j < charImg[0].length; j++) {
            bits[i][j] = charImg[i][j] > avg ? 1 : 0;
        }
    }
    return bits;
}
function flatten(matrix) {
    return matrix.flat();
}
function matMul(a, b) {
    const x = a.length, z = a[0].length, y = b[0].length;
    const product = Array(x).fill(0).map(() => Array(y).fill(0));
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            for (let k = 0; k < z; k++) {
                product[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return product;
}
function matAdd(a, b) {
    return a.map((val, i) => val + b[i]);
}
function softmax(vec) {
    const exps = vec.map(x => Math.exp(x));
    const sumExps = exps.reduce((a, b) => a + b);
    return exps.map(e => e / sumExps);
}
async function solveCaptchaServer(base64) {
    const LABEL_TEXT = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const img = await (0, canvas_1.loadImage)(base64);
    const canvas = (0, canvas_1.createCanvas)(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, img.width, img.height);
    const charBlocks = getImageBlocks(data, img.width, img.height);
    let result = "";
    for (const block of charBlocks) {
        let inputVector = [flatten(binarizeImage(block))];
        let output = matMul(inputVector, bitmaps_1.bitmaps.weights);
        const logits = matAdd(output[0], bitmaps_1.bitmaps.biases);
        const probabilities = softmax(logits);
        result += LABEL_TEXT[probabilities.indexOf(Math.max(...probabilities))];
    }
    return result;
}
//# sourceMappingURL=solveCaptcha.js.map