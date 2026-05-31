const BasePage = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/dang-ky';
    this.fullNameInput = 'input#full_name';
    this.emailInput = 'input#email';
    this.passwordInput = 'input#password';
    this.passwordConfirmInput = 'input#password1';
    this.addressInput = 'input#address';
    this.mobileInput = 'input#mobile';
    this.genderMaleRadio = 'input[name="info[gender]"][value="male"]';
    this.submitButton = 'input.btn_red[value="Đăng ký"]';
    
    // Alert or success/error messages
    this.errorMessageSelector = '.alert-danger, .error-message, .validation-message'; // typical indicators
  }

  async navigateToRegister() {
    await this.navigate(this.url);
  }

  async register(fullName, email, password, address, mobile) {
    await this.page.fill(this.fullNameInput, fullName);
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.fill(this.passwordConfirmInput, password);
    await this.page.fill(this.addressInput, address);
    await this.page.fill(this.mobileInput, mobile);
    await this.page.click(this.genderMaleRadio);
    
    await this.page.click(this.submitButton);
  }
}

module.exports = RegisterPage;
