var React = require('react');

module.exports = React.createClass({
    render: function () {
        console.log('VolunteerRow');
        console.log(this.props.volunteer);
        var volunteer = this.props.volunteer;
        if (!volunteer){
            console.log('volunteer is falsy');
            return null;
        }
        else
            return (
                <tr className="volunteer-row">
                    <td>{volunteer.profileId}</td>
                    <td>{volunteer.email}</td>
                    <td>{volunteer.firstName}</td>
                    <td>{volunteer.lastName}</td>
                    <td>{volunteer.department}</td>
                    <td>{volunteer.role}</td>
                    <td>{volunteer.volunteerType}</td>
                    <td>{volunteer.isProduction}</td>
                    <td>{volunteer.phone}</td>
                    <td>{volunteer.gotTicket}</td>
                </tr>
            );
    }
});