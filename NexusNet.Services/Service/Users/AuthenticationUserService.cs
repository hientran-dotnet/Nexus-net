using NexusNet.Repositories.Entities;
using NexusNet.Repositories.ViewModels;
using NexusNet.Services.Interface.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NexusNet.Services.Service.Users;

namespace NexusNet.Services.Service.Users
{
    public class AuthenticationUserService : IAuthenticationUserService
    {
        private readonly IUserService _userService;
        private readonly IUserPasswordService _userPasswordService;

        //public AuthenticationUserService(IUserService userService)
        //{
        //    _userService = userService;
        //}

        public AuthenticationUserService(IUserService userService, IUserPasswordService userPasswordService)
        {
            _userService = userService;
            _userPasswordService = userPasswordService;
        }

        public Task<(bool Success, string Message, User? user)> LoginAsync(LoginViewModel model)
        {
            throw new NotImplementedException();
        }

        public async Task<(bool Success, string Message, User? user)> RegisterAsync(RegisterViewModel model)
        {
            try
            {
                Console.WriteLine($"Username: {model.Username}");
                Console.WriteLine($"Email: {model.Email}");
                Console.WriteLine($"Password: {model.Password}");
                var existingUsername = await _userService.UsernameExistsAsync(model.Username);
                if(existingUsername)
                    return (false, "Username already exists.", null);

                var existingEmail = await _userService.EmailExistsAsync(model.Email);
                if(existingEmail)
                    return (false, "Email already exists.", null);

                var hashedPassword = await _userPasswordService.HashPasswordAsync(model.Password);

                var User = new User
                {
                    Username = model.Username,
                    Email = model.Email,
                    HashedPassword = hashedPassword,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var result = await _userService.AddUserAsync(User);
                
                return result 
                    ? (true, "Registration successful.", User) 
                    : (false, "Registration failed. Please try again.", null);

            }
            catch (Exception ex)
            {
                return (false, $"Registration failed: {ex.Message}", null);
            }
        }
    }
}
