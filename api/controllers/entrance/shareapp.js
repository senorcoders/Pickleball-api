module.exports = {


    friendlyName: 'shareapp',


    description: 'share app to friends',


    extendedDescription: ``,


    inputs: {

        email: {
            required: true,
            type: 'string',
            isEmail: true,
            description: 'The email address for share app',
        },

        idUser: {
            required: true,
            type: 'string'
        }

    },


    exits: {

        success: {
            description: 'successfully.'
        },

    },


    fn: async function (inputs) {
        inputs.email = inputs.email.toLowerCase();
        let user = await User.findOne({ id: inputs.idUser });
        require("../../../mailer").shareApp(user.fullName, inputs.email);
        this.res.json({ msg: "success" });
    }

};
