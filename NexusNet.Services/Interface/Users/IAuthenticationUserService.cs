using NexusNet.Repositories.Entities;
using NexusNet.Repositories.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NexusNet.Services.Interface.Users
{
    public interface IAuthenticationUserService
    {
        Task<(bool Success, string Message, User? user)> RegisterAsync(RegisterViewModel model); 
        Task<(bool Success, string Message, User? user)> LoginAsync(LoginViewModel model);
    }
}
