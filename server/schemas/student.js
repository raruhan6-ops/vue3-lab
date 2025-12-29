import { z } from 'zod';

export const studentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    course: z.string().min(1, 'Course is required'),
    score: z.number().min(0).max(100).or(z.string().transform(val => Number(val))).optional(),
    semester: z.string().min(1, 'Semester is required'),
    status: z.enum(['Active', 'Inactive']).default('Active')
});
