using NexusNet.Repositories.Entities;
using NexusNet.Repositories.Interface.Users;
using NexusNet.Repositories.Repository.Users;
using NexusNet.Services.Interface.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NexusNet.Services.Service.Users
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> AddUserAsync(User user)
        {
            return await _userRepository.AddUserAsync(user);
        }

        public Task DeleteUserAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _userRepository.EmailExistsAsync(email);
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
            return await _userRepository.UsernameExistsAsync(username);
        }
    }
}
