export class AuthRequiredError extends Error {
    constructor(message = 'Xuất trình giấy tờ, đăng nhập đầy đủ chưa?') {
        super(message)
        this.name = 'RequiredAuth'
    }
}