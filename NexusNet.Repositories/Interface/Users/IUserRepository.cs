using NexusNet.Repositories.Entities;

namespace NexusNet.Repositories.Interface.Users
{
    public interface IUserRepository
    {
        Task AddUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(int userId);
        Task<bool> UserExistsAsync(int userId);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);
    }
}
