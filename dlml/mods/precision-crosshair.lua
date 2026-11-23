local lg = love.graphics
local mod = { api = 1 }

function mod.drawCrosshair(x, y, blocked, _, dive)
    lg.setLineWidth(4)
    lg.setColor(0.03, 0.04, 0.04, 0.95)
    lg.circle("line", x, y, 8, 24)
    lg.setLineWidth(2)
    if blocked then lg.setColor(1, 0.44, 0.36) else lg.setColor(0.53, 1, 0.82) end
    lg.circle("line", x, y, 8, 24)
    lg.circle("fill", x, y, 1.5, 10)
    if dive and dive > 0 then
        lg.arc("line", "open", x, y, 13, -math.pi / 2, -math.pi / 2 + math.pi * 2 * dive, 24)
    end
    return true
end

return mod
