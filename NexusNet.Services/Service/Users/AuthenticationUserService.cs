using NexusNet.Repositories.Entities;
using NexusNet.Repositories.ViewModels;
using NexusNet.Services.Interface.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NexusNet.Services.Service.Users
{
    public class AuthenticationUserService : IAuthenticationUserService
    {
        public Task<(bool Success, string Message, User? user)> LoginAsync(LoginViewModel model)
        {
            throw new NotImplementedException();
        }

        public Task<(bool Success, string Message, User? user)> RegisterAsync(RegisterViewModel model)
        {
            throw new NotImplementedException();
        }
    }
}
