const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/dang-nhap';
    this.emailInput = 'input#email';
    this.passwordInput = 'input#password';
    this.submitButton = 'input.btn_red[value="Đăng nhập"]';
  }

  async navigateToLogin() {
    await this.navigate(this.url);
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }
}

module.exports = LoginPage;
