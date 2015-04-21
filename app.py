from flask import render_template, Flask
import flask.ext.sqlalchemy
import flask.ext.restless
from pprint import pprint
import json
import flask
from sqlalchemy import func

app = Flask(__name__, static_folder='public', static_url_path='')
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cvs.db'
db = flask.ext.sqlalchemy.SQLAlchemy(app)


class Stop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sid = db.Column(db.Integer)
    onstreet = db.Column(db.String)
    offstreet = db.Column(db.String)
    route = db.Column(db.String)
    boardings = db.Column(db.Float)
    alightings = db.Column(db.Float)
    daytype = db.Column(db.String)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    def __repr__(self):
        return "< Stop(sid='%s', onstreet='%s', offstreet='%s', route='%s', boardings='%s',alightings='%s', daytype='%s', latitude='%s', longitude='%s') >" % (self.sid, self.onstreet, self.offstreet, self.route, self.boardings, self.alightings, self.daytype, self.latitude, self.longitude)

db.create_all()
manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

manager.create_api(Stop, methods=['GET', 'POST', 'DELETE'], max_results_per_page=100000)
app.debug = True


def load_data(filename):

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


@app.route('/load_data')
def load_dat():
    stops = load_data('./outfile.txt')
    [db.session.add(aStop) for aStop in stops]
    db.session.commit()


@app.route('/moststops')
def moststops():
    most_stops = db.session.query(Stop.sid, func.count(Stop.sid)).group_by(Stop.sid).all()
    bins = {}
    for sid,val in most_stops:
        if val in bins:
            bins[val]["count"] +=1 
            bins[val]["stops"].append(sid)
        else:
            bins[val]= {"count" : 1, "stops" : [sid]}

    return json.dumps(bins)


@app.route('/mostroutes')
def mostroutes():
    longest_routes = db.session.query(Stop.route, func.count(Stop.route)).group_by(Stop.route).all()
    return json.dumps(longest_routes)


@app.route('/')
def main():
    return render_template('index.html', var='hello world')


@app.route('/test2', methods=['GET'])
def testtwo():
    return render_template('d3test2.html')

app.run()
