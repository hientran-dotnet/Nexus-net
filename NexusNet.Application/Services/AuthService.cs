using Microsoft.EntityFrameworkCore;
using NexusNet.Application.Models.Entities;
using NexusNet.Application.Models.ViewModels;
using NexusNet.Application.Services;
using NexusNet.Data;

namespace NexusNet.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHashService _passwordHashService;

        public AuthService(AppDbContext context, IPasswordHashService passwordHashService)
        {
            _context = context;
            _passwordHashService = passwordHashService;
        }

        public async Task<Account?> ValidateUserAsync(string username, string password)
        {
            var user = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.UserName == username && u.IsActive);

            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
                return null;

            bool isPasswordValid = _passwordHashService.VerifyPassword(password, user.PasswordHash);
            return isPasswordValid ? user : null;
        }

        public async Task<Account?> RegisterUserAsync(RegisterViewModel model)
        {
            // Check if username or email already exists
            var existingUser = await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.UserName == model.Username || u.Email == model.Email);

            if (existingUser != null)
                return null; // User already exists

            // Hash password
            string hashedPassword = _passwordHashService.HashPassword(model.Password);

            // Create new user
            var newUser = new Account
            {
                UserName = model.Username,
                Email = model.Email,
                PasswordHash = hashedPassword,
                DisplayName = model.Username,
                Role = "User", // Default role
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.UserAccounts.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }

        public async Task<Account?> GetUserByUsernameAsync(string username)
        {
            return await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.UserName == username && u.IsActive);
        }

        public async Task<Account?> GetUserByEmailAsync(string email)
        {
            return await _context.UserAccounts
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        }
    }
}