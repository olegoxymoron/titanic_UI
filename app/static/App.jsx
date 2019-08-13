const print = console.log;

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

GLOBAL.baseline = 0.6160;

class FeatureForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'accuracy': '',
			'previous_accuracy': '',
			'difference_from_baseline': '',
			'difference': ''
		};

		this.notFeatures = ['accuracy', 'difference_from_baseline', 'difference', 'previous_accuracy'];
		
		this.base = ['Pclass', 'Name', 'Sex', 'Age', 'SibSp',
           'Parch', 'Ticket', 'Fare', 'Cabin', 'Embarked'];
		this.additional = ['Name_length', 'FamilySize',
       'IsAlone', 'CategoricalFare', 'CategoricalAge', 'Title'];

		this.humanize = this.humanize.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.getFeatures = this.getFeatures.bind(this);
    }

    componentWillMount() {
		this.getFeatures();
	}

	humanize(feature) {
		var value;

		if (feature === 'Cabin') {
			value = 'Cabin number';
		} else if (feature === 'Pclass') {
			value = 'Ticket class';
		} else if (feature === 'Embarked') {
			value = 'Embarkation port';
		} else if (feature === 'Parch') {
			value = 'Number of children/parents';
		} else if (feature === 'SibSp') {
			value = 'Number of siblings/spouses';
		} else if (feature === 'Ticket') {
			value = 'Ticket number';
		} else if (feature === 'Name_length') {
			value = 'Name length';
		} else if (feature === 'FamilySize') {
			value = 'Family size';
		} else if (feature === 'IsAlone') {
			value = 'Is alone';
		} else if (feature === 'CategoricalFare') {
			value = 'Category of fare';
		} else if (feature === 'CategoricalAge') {
			value = 'Category of age';
		} else {
			value = feature;
		} 

		return value;
	}

	getFeatures() {
		axios({
			method: 'GET',
			url: '/features/',
			headers: GLOBAL.reqHeaders
		})
        .then(function (response) {
			this.setState(response.data, function () {
				print(this.state)
			});
		}.bind(this))
		.catch(function (response) {
			console.log(response);
		});
	}

    handleSubmit(event) {
		event.preventDefault();
		
		axios({
			method: 'POST',
			url: '/features/',
			data: _.omit(this.state, this.notFeatures),
			headers: GLOBAL.reqHeaders
		})
        .then(function (response) {
        	var new_accuracy = response.data;

			this.setState({
				'difference': round(new_accuracy - this.state.accuracy, 4),
				'difference_from_baseline': round(new_accuracy - GLOBAL.baseline, 4),
				'accuracy': new_accuracy,
				'previous_accuracy': this.state.accuracy
			});
		}.bind(this))
		.catch(function (response) {
			console.log(response);
		});
    }
	
	handleChange(event) {
		this.setState({[event.target.name]: !this.state[event.target.name]});
	}
	
	render() {
		return (
			<div>
				<form className="feature-form" onSubmit={this.handleSubmit}>
					<span className="header">Base Features</span>
					<div className="form-group feature-list">
					{Object.keys(_.pick(this.state, this.base)).map((key) => 
						<div className="form-inline feature-field">
							<label><span>{this.humanize(key.capitalize())}</span></label>
							<CheckBox name={key} value={this.state[key]} onChange={this.handleChange}/>
						</div>
					)}
					</div>
					<span className="header">Additional Features</span>
					<div className="form-group feature-list">
					{Object.keys(_.pick(this.state, this.additional)).map((key) => 
						<div className="form-inline feature-field">
							<label><span>{this.humanize(key.capitalize())}</span></label>
							<CheckBox name={key} value={this.state[key]} onChange={this.handleChange}/>
						</div>
					)}
					</div>
					<div className="form-group form-buttons">
						<button className="btn btn-primary" type="submit">Зберегти</button>
					</div>
					<div className="form-inline form-accuracy">
						<div>
							<span>Accuracy: </span><span>{this.state.accuracy}</span>
						</div>
						<div>
							<span>Difference from previous predict: </span><span className={this.state.difference>0?'green':'red'}>{this.state.previous_accuracy?this.state.difference:''}</span>
						</div>
						<div>
							<span>Difference from baseline: </span><span className={this.state.difference_from_baseline>0?'green':'red'}>{this.state.difference_from_baseline}</span>
						</div>
					</div>
				</form>
			</div>
        );
    }
}

class Header extends React.Component {
	render() {
		return (
			<div id="header">
			    <span className="margin_left">
					Titanic
			    </span>
			</div>
		);
    }
}

class Footer extends React.Component {
    render() {
		return (
			<div id="footer">
			    <span>
					Футер
			    </span>
		    </div>
		);
    }
}

class HomePage extends React.Component {
	render() {
		return (
    		<div id="container">
			    <div id="content">
			    	<FeatureForm />
				</div>
			</div>
		);
    }
}

class CheckBox extends React.Component {
	constructor(props) {
		super(props);

		this.name = props.name;
        //getting state from props
		this.state = {
			value: props.value
		};

		this.handleChange = this.handleChange.bind(this);
    }

    //setting target elem and sending it inside event to handleChange of filterform
    handleChange(e) {
    	e.target = this.refs.checkbox;
    	this.props.onChange(e);
    }

    //start cpvPredict slider working after render
    componentDidMount() {
        $('#toggle-'+this.name).bootstrapToggle();
    }

    //change cpvPredict slider state after props change (after changes cancelling in filter form)
    componentWillReceiveProps(nextProps) {
    	$('#toggle-'+this.name).bootstrapToggle(nextProps.value?'on':'off');
    	this.setState({
    		value: nextProps.value
    	});
    }

    render() {
    	return (
    		<div className="feature_checkbox" onClick={this.handleChange}>
    			<input ref="checkbox" id={'toggle-'+this.name} name={this.name} 
        				type="checkbox" checked={this.state.value} data-toggle="toggle"
        				 data-onstyle="success" data-offstyle="danger" data-style="ios"
        				  data-on="Включено" data-off="Виключено" />
    		</div>
        );
	}
}

$(function () {
	GLOBAL.containerTag = document.getElementById('container');
	GLOBAL.rootTag = document.getElementById('root');

	GLOBAL.headerTag = document.getElementById('header');
	GLOBAL.contentTag = document.getElementById('content');
	GLOBAL.footerTag = document.getElementById('footer');
	GLOBAL.reqHeaders = {'Content-Type': 'application/json'};

	GLOBAL.csrf_token = (function (c_name) {
	    if(document.cookie.length > 0) {
	        let c_start = document.cookie.indexOf(c_name + "=");
	        if(c_start != -1) {
	            c_start = c_start + c_name.length + 1;
	            let c_end = document.cookie.indexOf(";", c_start);
	            if(c_end == -1) c_end = document.cookie.length;
	            return unescape(document.cookie.substring(c_start,c_end));
	        }
	    }
	    return "";
	})("csrftoken");

	ReactDOM.render(
	    <HomePage />,
	    GLOBAL.rootTag
	);
});