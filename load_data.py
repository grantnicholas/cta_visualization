from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float
import sqlalchemy
import json

Base = declarative_base()


class Stop(Base):
    __tablename__ = 'stops'

    id = Column(Integer, primary_key=True)
    sid = Column(Integer)
    onstreet = Column(String)
    offstreet = Column(String)
    route = Column(String)
    boardings = Column(Float)
    alightings = Column(Float)
    daytype = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

    def __repr__(self):
        return "< Stop(sid='%s', onstreet='%s', offstreet='%s', route='%s', boardings='%s',alightings='%s', daytype='%s', latitude='%s', longitude='%s') >" % (self.sid, self.onstreet, self.offstreet, self.route, self.boardings, self.alightings, self.daytype, self.latitude, self.longitude)


def load_data(filename):
    import json
    from pprint import pprint 

    with open(filename, 'r') as f:
        json_stops = json.load(f)
        lookup = {}
        lookup['id'] = 'sid'
        lookup['onstreet'] = '35974832'
        lookup['offstreet'] = '35974833'
        lookup['routes'] = '35974834'
        lookup['boardings'] = '35974835'
        lookup['alightings'] = '35974836'
        lookup['daytype'] = '35974838'
        lookup['location'] = '35974839'
        lookup['latitude'] = 'latitude'
        lookup['longitude'] = 'longitude'
        stops = []
        for stop in json_stops:
            if lookup['routes'] in stop:
	            for route in stop[lookup['routes']].split(','):
	                print route
	                aStop = Stop(sid=int(stop[lookup['id']]),
	                    onstreet=stop[lookup['onstreet']],
	                	offstreet=stop[lookup['offstreet']],
		                route=route,
		            	boardings=float(stop[lookup['boardings']]),
		            	alightings=float(stop[lookup['alightings']]),
		            	daytype=stop[lookup['daytype']],
		                latitude=float(stop[lookup['location']][lookup['latitude']]),
		                longitude=float(stop[lookup['location']][lookup['longitude']]))
	                stops.append(aStop)
        return stops


engine = create_engine('sqlite:///civis.db', echo=True)
Base.metadata.create_all(engine)
metadata = sqlalchemy.MetaData(engine)

Session = sessionmaker(bind=engine)
session = Session()

# stops = load_data('./outfile.txt')
# [session.add(aStop) for aStop in stops]
# session.commit()

print session.query(Stop).filter_by(id=5).first()

longest_routes = session.query(Stop.sid, func.count(Stop.sid)).group_by(Stop.sid).all()

vals = map(lambda x: [x[1], x[0]], sorted(longest_routes, key=lambda r: [r[1], r[0]])[::-1])
bins = {}

for val in map(lambda v: v[0], vals):
    if val in bins:
        bins[val]+=1
    else:
        bins[val]=1


# THIS IS FOR TESTOUTPUT.txt
# print json.dumps(bins)


longest_routes = session.query(Stop.route, func.count(Stop.route)).group_by(Stop.route).all()
print json.dumps(longest_routes, sort_keys=True, indent=4, separators=(',', ': '))