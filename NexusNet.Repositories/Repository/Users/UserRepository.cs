using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NexusNet.Repositories.Entities;
using NexusNet.Repositories.Interface.Users;

namespace NexusNet.Repositories.Repository.Users
{
    public class UserRepository : IUserRepository
    {
        private readonly NexusNetAdminSourceDbContext _context;

        public UserRepository(NexusNetAdminSourceDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddUserAsync(User user)
        {
            try
            {
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
                Console.WriteLine("Add user successfully.");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Add user failed.");
                return false; 
            }
        }

        public Task DeleteUserAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public Task UpdateUserAsync(User user)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UserExistsAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.Users
                .AnyAsync(u => u.Username.ToLower() == username.ToLower());
        }
    }
}
