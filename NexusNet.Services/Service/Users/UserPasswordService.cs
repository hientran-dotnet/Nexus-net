using Konscious.Security.Cryptography;
using NexusNet.Services.Interface.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace NexusNet.Services.Service.Users
{
    public class UserPasswordService : IUserPasswordService
    {
        private const int SaltSize = 16; // Size of the salt in bytes
        private const int HashSize = 32; // Size of the hash in bytes
        private const int Iterations = 4; // Number of iterations for the hashing algorithm
        private const int MemorySize = 1024 * 1024; // Memory size for the hashing algorithm
        private const int DegreeOfParallelism = 8; // Degree of parallelism for the hashing algorithm

        public async Task<string> HashPasswordAsync(string password)
        {
            return await Task.Run(() =>
            {
                var salt = new byte[SaltSize];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(salt);
                }

                var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
                {
                    Salt = salt,
                    DegreeOfParallelism = DegreeOfParallelism,
                    Iterations = Iterations,
                    MemorySize = MemorySize
                };

                var hash = argon2.GetBytes(HashSize);

                var hashBytes = new byte[SaltSize + HashSize];
                Array.Copy(salt, 0, hashBytes, 0, SaltSize);
                Array.Copy(hash, 0, hashBytes, SaltSize, HashSize);

                return Convert.ToBase64String(hashBytes);
            });
        }
        public async Task<bool> VerifyPasswordAsync(string password, string StoredPassword)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var hashBytes = Convert.FromBase64String(StoredPassword);
                    var salt = new byte[SaltSize];
                    Array.Copy(hashBytes, 0, salt, 0, SaltSize);

                    var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
                    {
                        Salt = salt,
                        DegreeOfParallelism = DegreeOfParallelism,
                        Iterations = Iterations,
                        MemorySize = MemorySize
                    };

                    var computedHash = argon2.GetBytes(HashSize);

                    for (int i = 0; i < HashSize; i++)
                    {
                        if (hashBytes[i + SaltSize] != computedHash[i])
                        {
                            return false;
                        }
                    }

                    return true;
                }
                catch
                {
                    return false;
                }
            });
        }
    }
}
