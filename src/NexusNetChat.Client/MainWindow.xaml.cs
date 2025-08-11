using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace NexusNetChat.Client
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            
            // Auto-scroll to bottom when new messages are added
            MessagesScrollViewer.ScrollToBottom();
            
            // Handle Enter key in message input
            MessageInput.KeyDown += MessageInput_KeyDown;
        }

        private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                DragMove();
            }
        }

        private void Minimize_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private void Maximize_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void SendButton_Click(object sender, RoutedEventArgs e)
        {
            SendMessage();
        }

        private void MessageInput_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter && !string.IsNullOrWhiteSpace(MessageInput.Text))
            {
                SendMessage();
                e.Handled = true;
            }
        }

        private void SendMessage()
        {
            string messageText = MessageInput.Text.Trim();
            if (string.IsNullOrEmpty(messageText))
                return;

            // Create new message UI element
            var messageContainer = new Border
            {
                Style = (Style)FindResource("MessageStyle"),
                Margin = new Thickness(0, 4, 0, 0)
            };

            var grid = new Grid();
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Avatar
            var avatar = new Ellipse
            {
                Width = 40,
                Height = 40,
                Fill = new SolidColorBrush(Color.FromRgb(0x88, 0x65, 0xF2)), // User color
                Margin = new Thickness(0, 0, 16, 0)
            };
            Grid.SetColumn(avatar, 0);

            // Message content panel
            var contentPanel = new StackPanel();
            Grid.SetColumn(contentPanel, 1);

            // Header with username and timestamp
            var headerPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 4)
            };

            var username = new TextBlock
            {
                Text = "You",
                Foreground = (SolidColorBrush)FindResource("InteractiveActive"),
                FontWeight = FontWeights.SemiBold
            };

            var timestamp = new TextBlock
            {
                Text = DateTime.Now.ToString("Today at h:mm tt"),
                Foreground = (SolidColorBrush)FindResource("TextMuted"),
                FontSize = 12,
                Margin = new Thickness(8, 0, 0, 0),
                VerticalAlignment = VerticalAlignment.Center
            };

            headerPanel.Children.Add(username);
            headerPanel.Children.Add(timestamp);

            // Message text
            var messageTextBlock = new TextBlock
            {
                Text = messageText,
                Foreground = (SolidColorBrush)FindResource("TextNormal"),
                TextWrapping = TextWrapping.Wrap
            };

            contentPanel.Children.Add(headerPanel);
            contentPanel.Children.Add(messageTextBlock);

            grid.Children.Add(avatar);
            grid.Children.Add(contentPanel);
            messageContainer.Child = grid;

            // Add to messages panel
            var messagesPanel = (StackPanel)MessagesScrollViewer.Content;
            messagesPanel.Children.Add(messageContainer);

            // Clear input and scroll to bottom
            MessageInput.Clear();
            MessagesScrollViewer.ScrollToBottom();
        }
    }
}