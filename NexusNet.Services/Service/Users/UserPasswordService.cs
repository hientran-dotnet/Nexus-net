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
            // Validate input first
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be null or empty", nameof(password));

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

        //public string HashPassword(string password)
        //{
        //    // Validate input
        //    if (string.IsNullOrEmpty(password))
        //        throw new ArgumentException("Password cannot be null or empty", nameof(password));

        //    // Generate salt
        //    byte[] salt = new byte[16];
        //    using (var rng = RandomNumberGenerator.Create())
        //    {
        //        rng.GetBytes(salt);
        //    }

        //    // Create Argon2id with proper parameters
        //    using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        //    {
        //        Salt = salt,
        //        DegreeOfParallelism = 8,    // Số thread song song
        //        Iterations = 4,             // Số lần lặp
        //        MemorySize = 1024 * 128     // 128 MB memory
        //    };

        //    // Generate hash
        //    byte[] hash = argon2.GetBytes(32); // 32 bytes hash

        //    // Combine salt + hash for storage
        //    byte[] result = new byte[salt.Length + hash.Length];
        //    Buffer.BlockCopy(salt, 0, result, 0, salt.Length);
        //    Buffer.BlockCopy(hash, 0, result, salt.Length, hash.Length);

        //    return Convert.ToBase64String(result);
        //}
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
