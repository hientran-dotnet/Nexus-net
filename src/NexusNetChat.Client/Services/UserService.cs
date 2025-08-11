using Microsoft.EntityFrameworkCore;
using EntityFramework.Entities;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace NexusNetChat.Client.Services
{
    public class AuthenticationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public EntityFramework.Entities.User? User { get; set; }
    }

    public class UserService
    {
        private readonly PasswordService _passwordService;

        public UserService()
        {
            _passwordService = new PasswordService();
        }

        /// <summary>
        /// Đăng ký người dùng mới
        /// </summary>
        public async Task<AuthenticationResult> RegisterAsync(string username, string email, string password, string fullName)
        {
            try
            {
                // Validate input
                var validationResult = ValidateRegistrationInput(username, email, password, fullName);
                if (!validationResult.Success)
                {
                    return validationResult;
                }

                using var context = new NexusNetChatContext();

                // Kiểm tra username đã tồn tại
                if (await context.Users.AnyAsync(u => u.Username == username).ConfigureAwait(false))
                {
                    return new AuthenticationResult
                    {
                        Success = false,
                        Message = "Tên người dùng đã tồn tại"
                    };
                }

                // Kiểm tra email đã tồn tại
                if (await context.Users.AnyAsync(u => u.Email == email).ConfigureAwait(false))
                {
                    return new AuthenticationResult
                    {
                        Success = false,
                        Message = "Email đã được sử dụng"
                    };
                }

                // Tạo salt và hash password
                string salt = _passwordService.GenerateSalt();
                string hashedPassword = await _passwordService.HashPasswordAsync(password, salt).ConfigureAwait(false);

                // Tạo user mới
                var user = new EntityFramework.Entities.User
                {
                    Username = username.Trim(),
                    Email = email.Trim().ToLower(),
                    FullName = fullName?.Trim(),
                    HashedPassword = hashedPassword,
                    PasswordSalt = salt,
                    CreateAt = DateTime.Now,
                    IsActive = "True",
                    Role = "user"
                };

                context.Users.Add(user);
                await context.SaveChangesAsync().ConfigureAwait(false);

                return new AuthenticationResult
                {
                    Success = true,
                    Message = "Đăng ký thành công",
                    User = user
                };
            }
            catch (Exception ex)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Đăng nhập người dùng
        /// </summary>
        public async Task<AuthenticationResult> LoginAsync(string usernameOrEmail, string password)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(usernameOrEmail) || string.IsNullOrWhiteSpace(password))
                {
                    return new AuthenticationResult
                    {
                        Success = false,
                        Message = "Vui lòng nhập đầy đủ thông tin"
                    };
                }

                using var context = new NexusNetChatContext();

                // Tìm user theo username hoặc email
                var user = await context.Users.FirstOrDefaultAsync(u => 
                    u.Username == usernameOrEmail.Trim() || 
                    u.Email == usernameOrEmail.Trim().ToLower()).ConfigureAwait(false);

                if (user == null)
                {
                    return new AuthenticationResult
                    {
                        Success = false,
                        Message = "Tên người dùng hoặc email không tồn tại"
                    };
                }

                // Kiểm tra tài khoản có active không
                if (user.IsActive != "True")
                {
                    return new AuthenticationResult
                    {
                        Success = false,
                        Message = "Tài khoản đã bị vô hiệu hóa"
                    };
                }

                // Verify password
                bool isPasswordValid = await _passwordService.VerifyPasswordAsync(password, user.PasswordSalt, user.HashedPassword).ConfigureAwait(false);
                
                if (!isPasswordValid)
                {
                    return new AuthenticationResult
                    {
                        Success = false,
                        Message = "Mật khẩu không chính xác"
                    };
                }

                // Cập nhật last login
                user.LastLogin = DateTime.Now;
                await context.SaveChangesAsync().ConfigureAwait(false);

                return new AuthenticationResult
                {
                    Success = true,
                    Message = "Đăng nhập thành công",
                    User = user
                };
            }
            catch (Exception ex)
            {
                return new AuthenticationResult
                {
                    Success = false,
                    Message = $"Đã xảy ra lỗi: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Validate dữ liệu đăng ký
        /// </summary>
        private AuthenticationResult ValidateRegistrationInput(string username, string email, string password, string fullName)
        {
            // Validate username
            if (string.IsNullOrWhiteSpace(username))
            {
                return new AuthenticationResult { Success = false, Message = "Vui lòng nhập tên người dùng" };
            }

            if (username.Trim().Length < 3)
            {
                return new AuthenticationResult { Success = false, Message = "Tên người dùng phải có ít nhất 3 ký tự" };
            }

            if (username.Trim().Length > 50)
            {
                return new AuthenticationResult { Success = false, Message = "Tên người dùng không được vượt quá 50 ký tự" };
            }

            // Validate email
            if (string.IsNullOrWhiteSpace(email))
            {
                return new AuthenticationResult { Success = false, Message = "Vui lòng nhập email" };
            }

            if (!IsValidEmail(email))
            {
                return new AuthenticationResult { Success = false, Message = "Định dạng email không hợp lệ" };
            }

            if (email.Trim().Length > 100)
            {
                return new AuthenticationResult { Success = false, Message = "Email không được vượt quá 100 ký tự" };
            }

            // Validate password
            if (string.IsNullOrWhiteSpace(password))
            {
                return new AuthenticationResult { Success = false, Message = "Vui lòng nhập mật khẩu" };
            }

            if (password.Length < 6)
            {
                return new AuthenticationResult { Success = false, Message = "Mật khẩu phải có ít nhất 6 ký tự" };
            }

            // Validate full name
            if (!string.IsNullOrWhiteSpace(fullName) && fullName.Trim().Length > 255)
            {
                return new AuthenticationResult { Success = false, Message = "Họ và tên không được vượt quá 255 ký tự" };
            }

            return new AuthenticationResult { Success = true };
        }

        /// <summary>
        /// Kiểm tra định dạng email
        /// </summary>
        private bool IsValidEmail(string email)
        {
            try
            {
                var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                return emailRegex.IsMatch(email.Trim());
            }
            catch
            {
                return false;
            }
        }
    }
}
