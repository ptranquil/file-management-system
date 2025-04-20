import { object, string } from "zod";

const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const userLoginSchema = object({
    email: string().trim().refine(val => {
        return validateEmail(val)
    }),
    password: string().min(7).max(30).refine(val => {
        return !val.toLowerCase().includes('password')
    }, { message: "password musn\'t contain password" })
});

export const userSchema = object({
    name: string().trim().min(2)
}).merge(userLoginSchema);