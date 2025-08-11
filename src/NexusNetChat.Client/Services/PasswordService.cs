using Konscious.Security.Cryptography;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace NexusNetChat.Client.Services
{
    public class PasswordService
    {
        private const int SaltSize = 32; // 256 bits
        private const int HashSize = 32; // 256 bits
        private const int Iterations = 4;
        private const int MemorySize = 1024 * 1024; // 1 GB
        private const int DegreeOfParallelism = 8;

        /// <summary>
        /// Tạo salt ngẫu nhiên
        /// </summary>
        /// <returns>Salt dưới dạng Base64</returns>
        public string GenerateSalt()
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] salt = new byte[SaltSize];
            rng.GetBytes(salt);
            return Convert.ToBase64String(salt);
        }

        /// <summary>
        /// Hash mật khẩu sử dụng Argon2id
        /// </summary>
        /// <param name="password">Mật khẩu gốc</param>
        /// <param name="salt">Salt dưới dạng Base64</param>
        /// <returns>Hash mật khẩu dưới dạng Base64</returns>
        public async Task<string> HashPasswordAsync(string password, string salt)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be null or empty", nameof(password));
            
            if (string.IsNullOrEmpty(salt))
                throw new ArgumentException("Salt cannot be null or empty", nameof(salt));

            byte[] saltBytes = Convert.FromBase64String(salt);
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);

            using var argon2 = new Argon2id(passwordBytes)
            {
                Salt = saltBytes,
                DegreeOfParallelism = DegreeOfParallelism,
                Iterations = Iterations,
                MemorySize = MemorySize
            };

            byte[] hashBytes = await argon2.GetBytesAsync(HashSize);
            return Convert.ToBase64String(hashBytes);
        }

        /// <summary>
        /// Xác minh mật khẩu
        /// </summary>
        /// <param name="password">Mật khẩu nhập vào</param>
        /// <param name="salt">Salt được lưu</param>
        /// <param name="hashedPassword">Hash mật khẩu được lưu</param>
        /// <returns>True nếu mật khẩu đúng</returns>
        public async Task<bool> VerifyPasswordAsync(string password, string salt, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(salt) || string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                string newHash = await HashPasswordAsync(password, salt);
                return newHash == hashedPassword;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Hash password và tạo salt - trả về tuple (hashedPassword, salt)
        /// </summary>
        /// <param name="password">Mật khẩu gốc</param>
        /// <returns>Tuple chứa (hashedPassword, salt)</returns>
        public (string hashedPassword, string salt) HashPassword(string password)
        {
            string salt = GenerateSalt();
            string hashedPassword = HashPasswordAsync(password, salt).Result;
            return (hashedPassword, salt);
        }

        /// <summary>
        /// Verify password đồng bộ
        /// </summary>
        /// <param name="password">Mật khẩu nhập vào</param>
        /// <param name="hashedPassword">Hash mật khẩu được lưu</param>
        /// <param name="salt">Salt được lưu</param>
        /// <returns>True nếu mật khẩu đúng</returns>
        public bool VerifyPassword(string password, string hashedPassword, string salt)
        {
            return VerifyPasswordAsync(password, salt, hashedPassword).Result;
        }
    }
}
