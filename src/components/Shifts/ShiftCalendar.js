import React from 'react';
import {observer} from 'mobx-react';
import moment from 'moment';
import _ from 'lodash';
import {Button} from 'react-bootstrap'


import BigCalendar from 'react-big-calendar';
require('react-big-calendar/lib/css/react-big-calendar.css');
BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);

const Event = ({event: {shift, onEdit, onDelete}}) =>
	<span>
		<strong>
			{shift.title}
		</strong>
		<p>	{shift.volunteers.length} volunteers</p>
		<div className="toolbar">
			<Button bsSize="xsmall" onClick={() => onEdit(shift)} className="glyphicon glyphicon-edit" />
			<Button bsSize="xsmall" onClick={() => onDelete(shift)} className="glyphicon glyphicon-trash" />
		</div>
	</span>

const views = ['week', 'day']
export default observer(({shiftManagerModel: { date, filteredShifts, weekView, editShift, deleteShift}}) => (
	<BigCalendar
		date={moment(date)}
		view={weekView ? 'week' : 'day'}
		toolbar={false}
		components={{
			event: Event
		}}
		events={_.toArray(filteredShifts).map((shift) => ({
			start: new Date(shift.startDate),
			end: new Date(shift.endDate),
			shift,
			onEdit: editShift,
			onDelete: deleteShift
		}))}
	/>
));