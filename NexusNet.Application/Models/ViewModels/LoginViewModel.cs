using System.ComponentModel.DataAnnotations;

namespace NexusNet.Application.Models.ViewModels
{
    public class LoginViewModel
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Username is required.")]   
        public string? UserName { get; set; }
        [Required(AllowEmptyStrings = false, ErrorMessage = "Password is required.")]
        public string? Password { get; set; }
    }
}
