using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WarehouseManager.Data;

[ApiController]
[Route("api/[controller]")]
public class BalancesController : ControllerBase
{
    private readonly WarehouseDbContext _db;
    public BalancesController(WarehouseDbContext db) => _db = db;

    public record BalanceRow(Guid ResourceId, Guid UnitId, string ResourceName, string UnitName, decimal Quantity);

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid? resourceId, [FromQuery] Guid? unitId)
    {
        var incomingAgg =
            from ri in _db.ReceiptItems
            group ri by new { ri.ResourceId, ri.UnitId } into g
            select new
            {
                g.Key.ResourceId,
                g.Key.UnitId,
                Qty = g.Sum(x => x.Quantity)
            };

        var outgoingAgg =
            from si in _db.ShipmentItems
            group si by new { si.ResourceId, si.UnitId } into g
            select new
            {
                g.Key.ResourceId,
                g.Key.UnitId,
                Qty = -g.Sum(x => x.Quantity)
            };

        var unionAgg = incomingAgg.Concat(outgoingAgg);

        if (resourceId.HasValue)
            unionAgg = unionAgg.Where(x => x.ResourceId == resourceId.Value);
        if (unitId.HasValue)
            unionAgg = unionAgg.Where(x => x.UnitId == unitId.Value);

        var finalAgg =
            from u in unionAgg
            group u by new { u.ResourceId, u.UnitId } into g
            select new
            {
                g.Key.ResourceId,
                g.Key.UnitId,
                Quantity = g.Sum(x => x.Qty)
            };

        var result =
            await (from a in finalAgg
                   join r in _db.Resources on a.ResourceId equals r.Id
                   join u in _db.Units on a.UnitId equals u.Id
                   where a.Quantity != 0
                   select new BalanceRow(a.ResourceId, a.UnitId, r.Name, u.Name, a.Quantity))
                  .AsNoTracking()
                  .ToListAsync();

        return Ok(result);
    }
}
