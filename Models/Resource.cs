using System;
using System.ComponentModel.DataAnnotations;

namespace WarehouseManager.Models
{
    public class Resource
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; }

        public bool IsArchived { get; set; }
    }
}
