using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace NexusNetChat.Client.Controls
{
    /// <summary>
    /// Interaction logic for MessageItem.xaml
    /// </summary>
    public partial class MessageItem : UserControl
    {
        public static readonly DependencyProperty UsernameProperty =
            DependencyProperty.Register("Username", typeof(string), typeof(MessageItem), new PropertyMetadata("User"));

        public static readonly DependencyProperty MessageTextProperty =
            DependencyProperty.Register("MessageText", typeof(string), typeof(MessageItem), new PropertyMetadata(""));

        public static readonly DependencyProperty TimestampProperty =
            DependencyProperty.Register("Timestamp", typeof(string), typeof(MessageItem), new PropertyMetadata(""));

        public static readonly DependencyProperty AvatarColorProperty =
            DependencyProperty.Register("AvatarColor", typeof(Brush), typeof(MessageItem), 
                new PropertyMetadata(new SolidColorBrush(Color.FromRgb(0x72, 0x89, 0xDA))));

        public static readonly DependencyProperty UsernameColorProperty =
            DependencyProperty.Register("UsernameColor", typeof(Brush), typeof(MessageItem), 
                new PropertyMetadata(new SolidColorBrush(Colors.White)));

        public string Username
        {
            get { return (string)GetValue(UsernameProperty); }
            set { SetValue(UsernameProperty, value); }
        }

        public string MessageText
        {
            get { return (string)GetValue(MessageTextProperty); }
            set { SetValue(MessageTextProperty, value); }
        }

        public string Timestamp
        {
            get { return (string)GetValue(TimestampProperty); }
            set { SetValue(TimestampProperty, value); }
        }

        public Brush AvatarColor
        {
            get { return (Brush)GetValue(AvatarColorProperty); }
            set { SetValue(AvatarColorProperty, value); }
        }

        public Brush UsernameColor
        {
            get { return (Brush)GetValue(UsernameColorProperty); }
            set { SetValue(UsernameColorProperty, value); }
        }

        public MessageItem()
        {
            InitializeComponent();
        }
    }
}
