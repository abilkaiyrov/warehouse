using System;
using System.ComponentModel.DataAnnotations;

namespace WarehouseManager.Models
{
    public class Client
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(200)]
        public string Address { get; set; }

        public bool IsArchived { get; set; } = false;
    }
}
