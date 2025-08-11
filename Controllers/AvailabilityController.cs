using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using WarehouseManager.Data;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController : ControllerBase
{
    private readonly WarehouseDbContext _db;
    public AvailabilityController(WarehouseDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var receipts = await _db.ReceiptItems
            .GroupBy(x => new { x.ResourceId, x.UnitId })
            .Select(g => new {
                g.Key.ResourceId,
                g.Key.UnitId,
                Qty = g.Sum(x => x.Quantity)
            })
            .ToListAsync();

        var dictRes = await _db.Resources.ToDictionaryAsync(r => r.Id, r => r.Name);
        var dictUnit = await _db.Units.ToDictionaryAsync(u => u.Id, u => u.Name);

        var result = receipts.Select(r => new {
            resourceId = r.ResourceId,
            resourceName = dictRes.TryGetValue(r.ResourceId, out var rn) ? rn : "",
            unitId = r.UnitId,
            unitName = dictUnit.TryGetValue(r.UnitId, out var un) ? un : "",
            available = r.Qty
        });

        return Ok(result);
    }
}
