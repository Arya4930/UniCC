import { Router } from "express";
/**
 * @openapi
 * /api/schedule:
 *   post:
 *     tags:
 *       - Academics
 *     summary: Fetch examination schedule for a semester
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cookies
 *               - authorizedID
 *               - csrf
 *               - semesterId
 *             properties:
 *               cookies:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *               authorizedID:
 *                 type: string
 *                 example: 24BCE1234
 *               csrf:
 *                 type: string
 *               semesterId:
 *                 type: string
 *                 example: CH20242501
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 semester:
 *                   type: string
 *                 Schedule:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         courseCode:
 *                           type: string
 *                         courseTitle:
 *                           type: string
 *                         classId:
 *                           type: string
 *                         slot:
 *                           type: string
 *                         examDate:
 *                           type: string
 *                         examSession:
 *                           type: string
 *                         reportingTime:
 *                           type: string
 *                         examTime:
 *                           type: string
 *                         venue:
 *                           type: string
 *                         seatLocation:
 *                           type: string
 *                         seatNo:
 *                           type: string
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
declare const router: Router;
export default router;
//# sourceMappingURL=schedule.d.ts.map