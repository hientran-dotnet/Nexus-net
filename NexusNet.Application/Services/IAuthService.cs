using NexusNet.Application.Models.Entities;
using NexusNet.Application.Models.ViewModels;

namespace NexusNet.Application.Services
{
    public interface IAuthService
    {
        Task<Account?> ValidateUserAsync(string username, string password);
        Task<Account?> RegisterUserAsync(RegisterViewModel model);
        Task<Account?> GetUserByUsernameAsync(string username);
        Task<Account?> GetUserByEmailAsync(string email);
    }
}
