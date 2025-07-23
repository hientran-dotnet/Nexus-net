using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NexusNet.Repositories.Entities;
using NexusNet.Repositories.Interface.Users;

namespace NexusNet.Repositories.Repository.Users
{
    public class UserRepository : IUserRepository
    {
        public Task AddUserAsync(User user)
        {
            throw new NotImplementedException();
        }

        public Task DeleteUserAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> EmailExistsAsync(string email)
        {
            throw new NotImplementedException();
        }

        public Task UpdateUserAsync(User user)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UserExistsAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UsernameExistsAsync(string username)
        {
            throw new NotImplementedException();
        }
    }
}
