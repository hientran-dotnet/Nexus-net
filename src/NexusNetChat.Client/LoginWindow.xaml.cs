using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using EntityFramework.Entities;
using NexusNetChat.Client.Services;
using NexusNetChat.Client.Utils;

namespace NexusNetChat.Client
{
    /// <summary>
    /// Interaction logic for LoginWindow.xaml
    /// </summary>
    public partial class LoginWindow : Window
    {
        private readonly UserService _userService;

        public LoginWindow()
        {
            InitializeComponent();
            _userService = new UserService();
        }

        private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                DragMove();
            }
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        private async void Login_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                HideErrorMessage();

                // Disable button và hiển thị loading
                var loginButton = sender as System.Windows.Controls.Button;
                if (loginButton != null)
                {
                    loginButton.IsEnabled = false;
                    loginButton.Content = "Đang đăng nhập...";
                }

                string usernameOrEmail = LoginUsernameTextBox.Text.Trim();
                string password = LoginPasswordBox.Password;

                var result = await _userService.LoginAsync(usernameOrEmail, password);

                if (result.Success && result.User != null)
                {
                    // Set user session
                    UserSession.CurrentUser = result.User;
                    
                    // Mở main window và đóng login window
                    var mainWindow = new MainWindow();
                    mainWindow.Show();
                    this.Close();
                }
                else
                {
                    ShowErrorMessage(result.Message);
                }
            }
            catch (Exception ex)
            {
                ShowErrorMessage($"Đã xảy ra lỗi: {ex.Message}");
            }
            finally
            {
                // Restore button
                var loginButton = sender as System.Windows.Controls.Button;
                if (loginButton != null)
                {
                    loginButton.IsEnabled = true;
                    loginButton.Content = "Đăng nhập";
                }
            }
        }

        private async void Register_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                HideErrorMessage();

                // Disable button và hiển thị loading
                var registerButton = sender as System.Windows.Controls.Button;
                if (registerButton != null)
                {
                    registerButton.IsEnabled = false;
                    registerButton.Content = "Đang đăng ký...";
                }

                // Validate confirm password
                if (RegisterPasswordBox.Password != RegisterConfirmPasswordBox.Password)
                {
                    ShowErrorMessage("Mật khẩu xác nhận không khớp");
                    return;
                }

                string username = RegisterUsernameTextBox.Text.Trim();
                string email = RegisterEmailTextBox.Text.Trim();
                string password = RegisterPasswordBox.Password;
                string fullName = RegisterFullNameTextBox.Text.Trim();

                var result = await _userService.RegisterAsync(username, email, password, fullName);

                if (result.Success)
                {
                    MessageBox.Show("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.", "Thành công", 
                        MessageBoxButton.OK, MessageBoxImage.Information);

                    // Switch back to login form và clear form
                    ShowLogin_Click(sender, e);
                    
                    // Pre-fill username for convenience
                    LoginUsernameTextBox.Text = username;
                }
                else
                {
                    ShowErrorMessage(result.Message);
                }
            }
            catch (Exception ex)
            {
                ShowErrorMessage($"Đã xảy ra lỗi: {ex.Message}");
            }
            finally
            {
                // Restore button
                var registerButton = sender as System.Windows.Controls.Button;
                if (registerButton != null)
                {
                    registerButton.IsEnabled = true;
                    registerButton.Content = "Đăng ký";
                }
            }
        }

        private void ShowLogin_Click(object sender, RoutedEventArgs e)
        {
            LoginPanel.Visibility = Visibility.Visible;
            RegisterPanel.Visibility = Visibility.Collapsed;
            HideErrorMessage();
            ClearRegisterForm();
        }

        private void ShowRegister_Click(object sender, RoutedEventArgs e)
        {
            LoginPanel.Visibility = Visibility.Collapsed;
            RegisterPanel.Visibility = Visibility.Visible;
            HideErrorMessage();
            ClearLoginForm();
        }

        private void ForgotPassword_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Tính năng quên mật khẩu sẽ được phát triển trong tương lai.", 
                "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ShowErrorMessage(string message)
        {
            ErrorMessageTextBlock.Text = message;
            ErrorMessageTextBlock.Visibility = Visibility.Visible;
        }

        private void HideErrorMessage()
        {
            ErrorMessageTextBlock.Visibility = Visibility.Collapsed;
        }

        private void ClearLoginForm()
        {
            LoginUsernameTextBox.Clear();
            LoginPasswordBox.Clear();
        }

        private void ClearRegisterForm()
        {
            RegisterFullNameTextBox.Clear();
            RegisterEmailTextBox.Clear();
            RegisterUsernameTextBox.Clear();
            RegisterPasswordBox.Clear();
            RegisterConfirmPasswordBox.Clear();
        }
    }
}
