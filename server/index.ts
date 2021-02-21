import { ConfigureApollo } from "../apollo";
import express from 'express';
import {ConfigureREST} from "../rest";

const app = express();

ConfigureApollo(app);
ConfigureREST(app);

app.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`),
);