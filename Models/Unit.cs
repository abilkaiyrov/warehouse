using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WarehouseManager.Models
{
    public class Unit
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; }

        public bool IsArchived { get; set; }
    }
}