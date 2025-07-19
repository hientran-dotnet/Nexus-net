using Isopoh.Cryptography.Argon2;
using NexusNet.Application.Services;
using System.Security.Cryptography;
using System.Text;

namespace NexusNet.Application.Services
{
    public class PasswordHashService : IPasswordHashService
    {
        private const int SaltSize = 16; // 128 bits
        private const int HashSize = 32; // 256 bits
        private const int Iterations = 4;
        private const int MemorySize = 65536; // 64 MB
        private const int DegreeOfParallelism = 8;

        public string HashPassword(string password)
        {
            byte[] salt = GenerateSalt();
            byte[] hash = HashPasswordInternal(password, salt);

            // Combine salt and hash
            byte[] hashBytes = new byte[SaltSize + HashSize];
            Array.Copy(salt, 0, hashBytes, 0, SaltSize);
            Array.Copy(hash, 0, hashBytes, SaltSize, HashSize);

            return Convert.ToBase64String(hashBytes);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                byte[] hashBytes = Convert.FromBase64String(hashedPassword);

                // Extract salt and hash
                byte[] salt = new byte[SaltSize];
                byte[] hash = new byte[HashSize];
                Array.Copy(hashBytes, 0, salt, 0, SaltSize);
                Array.Copy(hashBytes, SaltSize, hash, 0, HashSize);

                byte[] testHash = HashPasswordInternal(password, salt);

                return CryptographicOperations.FixedTimeEquals(hash, testHash);
            }
            catch
            {
                return false;
            }
        }

        private byte[] GenerateSalt()
        {
            byte[] salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            return salt;
        }

        private byte[] HashPasswordInternal(string password, byte[] salt)
        {
            // Using Isopoh.Cryptography.Argon2 API
            var config = new Argon2Config
            {
                Type = Argon2Type.DataIndependentAddressing, // Argon2id
                Version = Argon2Version.Nineteen,
                TimeCost = Iterations,
                MemoryCost = MemorySize,
                Lanes = DegreeOfParallelism,
                Threads = Environment.ProcessorCount,
                Password = Encoding.UTF8.GetBytes(password),
                Salt = salt,
                HashLength = HashSize
            };

            var argon2A = new Argon2(config);
            return argon2A.Hash().Buffer;
        }
    }
}