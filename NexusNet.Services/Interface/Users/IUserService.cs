using NexusNet.Repositories.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NexusNet.Services.Interface.Users
{
    public interface IUserService
    {
        Task<bool> AddUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(int userId);
        Task<bool> UserExistsAsync(int userId);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);
    }
}
