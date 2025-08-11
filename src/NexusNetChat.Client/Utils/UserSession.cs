using EntityFramework.Entities;

namespace NexusNetChat.Client.Utils
{
    public static class UserSession
    {
        private static User? _currentUser;

        public static User? CurrentUser
        {
            get => _currentUser;
            set => _currentUser = value;
        }

        public static bool IsLoggedIn => _currentUser != null;

        public static void Logout()
        {
            _currentUser = null;
        }

        public static string GetDisplayName()
        {
            if (_currentUser == null) return "Guest";
            return !string.IsNullOrEmpty(_currentUser.FullName) ? _currentUser.FullName : _currentUser.Username;
        }
    }
}
