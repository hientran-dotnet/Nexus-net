using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NexusNet.Services.Interface.Users
{
    public interface IUserPasswordService
    {
        Task<string> HashPasswordAsync(string password);
        Task<bool> VerifyPasswordAsync(string password, string hashedPassword);
    }
}
