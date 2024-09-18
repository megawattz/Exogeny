
#macro Orbit(Radius)
       rotate <0, (-clock*800000/pow(Radius, 2.2)) + Radius, 0>
#end

#macro OrbitTilt(Radius, Angle)
       rotate <Angle, 0, 0> 
       rotate <0, (-clock*800000/pow(Radius, 2.2)) + Radius, 0>
#end

#macro OrbitOffset(Radius,Offset)
       rotate <0, (-clock*800000/pow(Radius, 2.2) + mod(Offset,360)), 0>
#end

#macro RotatePlanet(Factor)
   rotate <0, (v_random_float+clock)*Factor, 0>
#end

#macro TransformLocation(Location, Transform)
       vtransform(Location, Transform)
#end
